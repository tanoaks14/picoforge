const fs = require('fs').promises;
const path = require('path');

const SETUP_TEMPLATES = {
    spi_config: (params) => {
        const inst = params.inst || 'spi0';
        return `    // SPI Config (${inst})
    spi_init(${inst}, ${params.baud || 100000});
    gpio_set_function(${params.rx}, GPIO_FUNC_SPI);
    gpio_set_function(${params.sck}, GPIO_FUNC_SPI);
    gpio_set_function(${params.tx}, GPIO_FUNC_SPI);
    gpio_init(${params.csn});
    gpio_set_dir(${params.csn}, GPIO_OUT);
    gpio_put(${params.csn}, 1);`;
    },
    i2c_config: (params) => {
        const inst = params.inst || 'i2c0';
        return `    // I2C Config (${inst})
    i2c_init(${inst}, ${params.baud || 100000});
    gpio_set_function(${params.sda}, GPIO_FUNC_I2C);
    gpio_set_function(${params.scl}, GPIO_FUNC_I2C);
    gpio_pull_up(${params.sda});
    gpio_pull_up(${params.scl});`;
    },
    adc_config: (params) => {
        return `    // ADC Config (Pin ${params.pin})
    if (!adc_initialized) { adc_init(); adc_initialized = true; }
    adc_gpio_init(${params.pin});`;
    },
    pwm_config: (params) => {
        return `    // PWM Config (Pin ${params.pin})
    gpio_set_function(${params.pin}, GPIO_FUNC_PWM);
    uint slice_${params.pin} = pwm_gpio_to_slice_num(${params.pin});
    pwm_set_wrap(slice_${params.pin}, 65535);
    pwm_set_enabled(slice_${params.pin}, true);`;
    }
};

const LOOP_TEMPLATES = {
    gpio_set: (params) => `        gpio_put(${params.pin}, ${params.level});`,
    sleep: (params) => `        sleep_ms(${params.ms});`,
    uart_write: (params) => `        uart_puts(uart0, "${params.text}\\n");`,
    log: (params) => `        printf("${params.text}\\n");`,
    spi_write: (params) => `        // SPI Write
        gpio_put(${params.csn}, 0);
        spi_write_blocking(${params.inst || 'spi0'}, (const uint8_t*)"${params.data}", ${params.data.length});
        gpio_put(${params.csn}, 1);`,
    spi_read: (params) => `        // SPI Read
        uint8_t spi_rx_buf[${params.len || 1}];
        gpio_put(${params.csn}, 0);
        spi_read_blocking(${params.inst || 'spi0'}, 0, spi_rx_buf, ${params.len || 1});
        gpio_put(${params.csn}, 1);
        printf("SPI Read: %02x\\n", spi_rx_buf[0]);`,
    i2c_write: (params) => `        // I2C Write
        i2c_write_blocking(${params.inst || 'i2c0'}, ${params.addr}, (const uint8_t*)"${params.data}", ${params.data.length}, false);`,
    i2c_read: (params) => `        // I2C Read
        uint8_t i2c_rx_buf[${params.len || 1}];
        i2c_read_blocking(${params.inst || 'i2c0'}, ${params.addr}, i2c_rx_buf, ${params.len || 1}, false);
        printf("I2C Read: %02x\\n", i2c_rx_buf[0]);`,
    adc_read: (params) => `        // ADC Read
        adc_select_input(${params.pin} - 26);
        uint16_t adc_val_${params.pin} = adc_read();
        printf("ADC (Pin ${params.pin}): %d\\n", adc_val_${params.pin});`,
    pwm_set: (params) => `        // PWM Set Level
        pwm_set_gpio_level(${params.pin}, ${params.level}); // level 0-65535`,
    function_call: (params) => `        // Call user function
        ${params.ref}();`
};

const PROJECT_BOILERPLATE = {
    adc: {
        headers: ['#include "hardware/adc.h"'],
        setup: `    // ADC Initialization
    adc_init();
    // Make sure GPIO is high-impedance, no pullups etc
    adc_gpio_init(26);
    // Select ADC input 0 (GPIO26)
    adc_select_input(0);`,
        loop: `        // ADC Example reading
        // uint16_t result = adc_read();
        // printf("ADC value: %d\\n", result);`
    },
    pwm: {
        headers: ['#include "hardware/pwm.h"'],
        setup: `    // PWM Initialization
    // Tell GPIO 0 (or builtin LED) is allocated to the PWM
    gpio_set_function(PICO_DEFAULT_LED_PIN, GPIO_FUNC_PWM);
    // Find out which PWM slice is connected to GPIO 0
    uint slice_num = pwm_gpio_to_slice_num(PICO_DEFAULT_LED_PIN);
    // Set period of 4 cycles (0 to 3 inclusive)
    pwm_set_wrap(slice_num, 3);
    // Set channel A output high for one cycle before dropping
    pwm_set_chan_level(slice_num, PWM_CHAN_A, 1);
    // Set the PWM running
    pwm_set_enabled(slice_num, true);`,
        loop: `        // PWM Example update
        // pwm_set_chan_level(slice_num, PWM_CHAN_A, 2);`
    },
    gpio: {
        headers: ['#include "hardware/gpio.h"'],
        setup: `    // GPIO Initialization
    const uint LED_PIN = PICO_DEFAULT_LED_PIN;
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);`,
        loop: `        // GPIO Blink
        gpio_put(LED_PIN, 1);
        sleep_ms(250);
        gpio_put(LED_PIN, 0);
        sleep_ms(250);`
    },
    i2c: {
        headers: ['#include "hardware/i2c.h"'],
        setup: `    // I2C Initialization
    i2c_init(i2c_default, 100 * 1000);
    gpio_set_function(PICO_DEFAULT_I2C_SDA_PIN, GPIO_FUNC_I2C);
    gpio_set_function(PICO_DEFAULT_I2C_SCL_PIN, GPIO_FUNC_I2C);
    gpio_pull_up(PICO_DEFAULT_I2C_SDA_PIN);
    gpio_pull_up(PICO_DEFAULT_I2C_SCL_PIN);`,
        loop: ``
    },
    spi: {
        headers: ['#include "hardware/spi.h"'],
        setup: `    // SPI Initialization
    spi_init(spi_default, 500 * 1000);
    gpio_set_function(PICO_DEFAULT_SPI_RX_PIN, GPIO_FUNC_SPI);
    gpio_set_function(PICO_DEFAULT_SPI_SCK_PIN, GPIO_FUNC_SPI);
    gpio_set_function(PICO_DEFAULT_SPI_TX_PIN, GPIO_FUNC_SPI);
    // Chip select is active-low, so initialised to high
    gpio_init(PICO_DEFAULT_SPI_CSN_PIN);
    gpio_set_dir(PICO_DEFAULT_SPI_CSN_PIN, GPIO_OUT);
    gpio_put(PICO_DEFAULT_SPI_CSN_PIN, 1);`,
        loop: ``
    },
    uart: {
        headers: ['#include "hardware/uart.h"'],
        setup: `    // UART Initialization
    uart_init(uart0, 115200);
    gpio_set_function(0, GPIO_FUNC_UART);
    gpio_set_function(1, GPIO_FUNC_UART);
    uart_puts(uart0, "UART initialized\\n");`,
        loop: `        // UART Example
        // if (uart_is_readable(uart0)) {
        //     char c = uart_getc(uart0);
        //     uart_putc(uart0, c);
        // }`
    },
    multicore: {
        headers: ['#include "pico/multicore.h"'],
        setup: `    // Multicore Initialization
    void core1_entry() {
        while (1) {
            // tight_loop_contents();
            sleep_ms(500);
        }
    }
    // Launch core 1
    multicore_launch_core1(core1_entry);
    printf("Core 1 launched\\n");`,
        loop: ``
    }
};

class ScaffoldService {
    generateMainCpp(projectName, config) {
        const modules = Array.isArray(config) ? config : (config.modules || []);
        const blocks = !Array.isArray(config) && config.blocks ? config.blocks : [];

        let headers = ['#include <stdio.h>', '#include "pico/stdlib.h"'];
        let setupCode = [];
        let loopCode = [];
        let usedGpioPins = new Set();

        // 1. Process Modules (Legacy/Base Init)
        modules.forEach(mod => {
            const tmpl = PROJECT_BOILERPLATE[mod.toLowerCase()];
            if (tmpl) {
                if (tmpl.headers) headers.push(...tmpl.headers);
                if (tmpl.setup) setupCode.push(tmpl.setup);
                // Only add default loop code if NO blocks are provided
                if (blocks.length === 0 && tmpl.loop) loopCode.push(tmpl.loop);
            }
        });

        // 2. Scan Blocks for Auto-Initialization & Headers
        let adcInitAdded = false;
        blocks.forEach(block => {
            if (block.type === 'gpio_set') {
                usedGpioPins.add(block.params.pin);
            }
            if (block.type.startsWith('spi')) headers.push('#include "hardware/spi.h"');
            if (block.type.startsWith('i2c')) headers.push('#include "hardware/i2c.h"');
            if (block.type.startsWith('adc')) {
                headers.push('#include "hardware/adc.h"');
                // ADC needs a one-time global init variable for the template helper
                if (!adcInitAdded) {
                    setupCode.unshift('    bool adc_initialized = false;');
                    adcInitAdded = true;
                }
            }
            if (block.type.startsWith('pwm')) headers.push('#include "hardware/pwm.h"');
        });

        // 3. Generate Dynamic GPIO Init
        if (usedGpioPins.size > 0) {
            setupCode.push(`    // Auto-generated GPIO Init
    ${Array.from(usedGpioPins).map(pin => `gpio_init(${pin}); gpio_set_dir(${pin}, GPIO_OUT);`).join('\n    ')}`);
        }

        // 4. Process Blocks (Setup vs Loop)
        if (blocks.length > 0) {
            loopCode.push('        // --- Visual Builder Sequence ---');
            blocks.forEach(block => {
                // Check if it's a Setup Block
                if (SETUP_TEMPLATES[block.type]) {
                    setupCode.push(SETUP_TEMPLATES[block.type](block.params));
                }
                // Check if it's a Loop Block
                else if (LOOP_TEMPLATES[block.type]) {
                    loopCode.push(LOOP_TEMPLATES[block.type](block.params));
                }
                else {
                    loopCode.push(`        // Unknown block type: ${block.type}`);
                }
            });
        }

        // 5. Generate User-Defined Functions from function_def blocks
        const functionDefs = blocks.filter(b => b.type === 'function_def' && b.params.name);
        let functionCode = [];
        functionDefs.forEach(fn => {
            const fnName = fn.params.name;
            let fnBody = [];
            const innerBlocks = fn.params.innerBlocks || [];
            innerBlocks.forEach(inner => {
                if (LOOP_TEMPLATES[inner.type]) {
                    fnBody.push(LOOP_TEMPLATES[inner.type](inner.params));
                }
            });
            if (fnBody.length === 0) {
                fnBody.push('    // Empty function');
            }
            functionCode.push(`// User-defined function: ${fnName}\nvoid ${fnName}() {\n${fnBody.join('\n')}\n}`);
        });

        // Dedup headers
        headers = [...new Set(headers)];

        // Build the final C++ file
        const functionsSection = functionCode.length > 0 ? functionCode.join('\n\n') + '\n\n' : '';

        return `${headers.join('\n')}

${functionsSection}int main() {
    stdio_init_all();
    printf("Project: ${projectName} Initialized\\n");

${setupCode.join('\n\n')}

    while(true) {
        ${blocks.length === 0 ? 'sleep_ms(1000); // Heartbeat' : ''}
        
${loopCode.join('\n')}
    }
    return 0;
}
`;
    }

    generateCMakeLists(projectName, config) {
        const modules = Array.isArray(config) ? config : (config.modules || []);
        const blocks = !Array.isArray(config) && config.blocks ? config.blocks : [];

        // Base libraries
        let libs = new Set(['pico_stdlib']);

        // Add libraries from modules array
        modules.forEach(mod => {
            if (mod === 'multicore') {
                libs.add('pico_multicore');
            } else {
                libs.add(`hardware_${mod.toLowerCase()}`);
            }
        });

        // Auto-detect libraries from blocks
        blocks.forEach(block => {
            if (block.type.startsWith('spi')) libs.add('hardware_spi');
            if (block.type.startsWith('i2c')) libs.add('hardware_i2c');
            if (block.type.startsWith('adc')) libs.add('hardware_adc');
            if (block.type.startsWith('pwm')) libs.add('hardware_pwm');
            if (block.type === 'gpio_set') libs.add('hardware_gpio');
            if (block.type === 'uart_write') libs.add('hardware_uart');
        });

        const libsArray = [...libs];

        return `cmake_minimum_required(VERSION 3.12)
include($ENV{PICO_SDK_PATH}/external/pico_sdk_import.cmake)

project(${projectName} C CXX ASM)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

pico_sdk_init()

add_executable(${projectName}
    main.cpp
)

target_link_libraries(${projectName}
    ${libsArray.join('\n    ')}
)

pico_add_extra_outputs(${projectName})
`;
    }
}

module.exports = new ScaffoldService();
