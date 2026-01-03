const fs = require('fs').promises;
const path = require('path');
const blockRegistry = require('./block_registry');

// Cache for custom block code generation
let customBlockCache = new Map();

const generateBlockCode = async (block) => {
    if (block.type === 'if_block') {
        const condition = `${block.params.left} ${block.params.operator} ${block.params.right}`;
        const innerCodeParts = [];
        for (const b of (block.params.innerBlocks || [])) {
            innerCodeParts.push(await generateBlockCode(b));
        }
        return `        if (${condition}) {\n${innerCodeParts.join('\n')}\n        }`;
    }
    if (LOOP_TEMPLATES[block.type]) {
        return LOOP_TEMPLATES[block.type](block.params);
    }
    
    // Check custom block registry
    const customCode = await blockRegistry.generateCode(block);
    if (customCode && customCode.code) {
        return `        // Custom Block: ${block.type}\n        ${customCode.code}`;
    }
    
    return `        // Unknown block: ${block.type}`;
};

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
    },
    var_int: (params) => {
        return `    // Global Variable
    int ${params.name} = ${params.value || 0};`;
    }
};

const LOOP_TEMPLATES = {
    gpio_set: (params) => `        gpio_put(${params.pin}, ${params.level});`,
    sleep: (params) => `        sleep_ms(${params.ms});`,
    uart_write: (params) => `        uart_puts(uart0, "${params.text}\\n");`,
    log: (params) => `        printf("${params.text}\\n");`,
    code_snippet: (params) => `        // Custom Snippet
${params.code.split('\n').map(l => '        ' + l).join('\n')}`,
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
        ${params.ref}();`,
    var_set: (params) => `        ${params.name} = ${params.value};`
};

const PROJECT_BOILERPLATE = {
    gpio: {
        headers: ['#include "hardware/gpio.h"'],
        setup: `    // User LED Setup
    gpio_init(25);
    gpio_set_dir(25, GPIO_OUT);`,
        loop: `        // Blink LED
        gpio_put(25, 1);
        sleep_ms(500);
        gpio_put(25, 0);
        sleep_ms(500);`
    },
    adc: {
        headers: ['#include "hardware/adc.h"'],
        setup: `    // ADC Initialization
    adc_init();
    adc_gpio_init(26);`,
        loop: `        // Read ADC
        adc_select_input(0);
        uint16_t result = adc_read();
        printf("ADC Value: %d\\n", result);
        sleep_ms(500);`
    },
    pwm: {
        headers: ['#include "hardware/pwm.h"'],
        setup: `    // PWM Initialization (Pin 28)
    gpio_set_function(28, GPIO_FUNC_PWM);
    uint slice_num = pwm_gpio_to_slice_num(28);
    pwm_set_wrap(slice_num, 65535);
    pwm_set_enabled(slice_num, true);`,
        loop: `        // Update PWM
        pwm_set_gpio_level(28, 32768); // 50% duty`
    },
    i2c: {
        headers: ['#include "hardware/i2c.h"'],
        setup: `    // I2C Initialization
    i2c_init(i2c0, 100 * 1000);
    gpio_set_function(4, GPIO_FUNC_I2C);
    gpio_set_function(5, GPIO_FUNC_I2C);
    gpio_pull_up(4);
    gpio_pull_up(5);`,
        loop: `        // I2C Scan or operation
        // (Add logic here)`
    },
    spi: {
        headers: ['#include "hardware/spi.h"'],
        setup: `    // SPI Initialization
    spi_init(spi0, 500 * 1000);
    gpio_set_function(16, GPIO_FUNC_SPI);
    gpio_set_function(18, GPIO_FUNC_SPI);
    gpio_set_function(19, GPIO_FUNC_SPI);`,
        loop: `        // SPI Transfer
        // (Add logic here)`
    },
    uart: {
        headers: ['#include "hardware/uart.h"'],
        setup: `    // UART Initialization
    uart_init(uart0, 115200);
    gpio_set_function(0, GPIO_FUNC_UART);
    gpio_set_function(1, GPIO_FUNC_UART);`,
        loop: `        uart_puts(uart0, "Hello UART!\\n");`
    }
};

class ScaffoldService {
    async generateMainCpp(projectName, config) {
        const modules = Array.isArray(config) ? config : (config.modules || []);
        const blocks = !Array.isArray(config) && config.blocks ? config.blocks : [];

        let headers = ['#include <stdio.h>', '#include "pico/stdlib.h"'];
        let setupCode = [];
        let loopCode = [];
        let usedGpioPins = new Set();

        // 1. Process Modules (Legacy)
        modules.forEach(mod => {
            const tmpl = PROJECT_BOILERPLATE[mod.toLowerCase()];
            if (tmpl) {
                if (tmpl.headers) headers.push(...tmpl.headers);
                if (tmpl.setup) setupCode.push(tmpl.setup);
                if (blocks.length === 0 && tmpl.loop) loopCode.push(tmpl.loop);
            }
        });

        // 2. Scan Blocks for Headers/Init (including custom blocks)
        let adcInitAdded = false;
        for (const block of blocks) {
            if (block.type === 'gpio_set') usedGpioPins.add(block.params.pin);
            if (block.type.startsWith('spi')) headers.push('#include "hardware/spi.h"');
            if (block.type.startsWith('i2c')) headers.push('#include "hardware/i2c.h"');
            if (block.type.startsWith('adc')) {
                headers.push('#include "hardware/adc.h"');
                if (!adcInitAdded) {
                    setupCode.unshift('    bool adc_initialized = false;');
                    adcInitAdded = true;
                }
            }
            if (block.type.startsWith('pwm')) headers.push('#include "hardware/pwm.h"');
            
            // Check for custom block headers
            const customCode = await blockRegistry.generateCode(block);
            if (customCode && customCode.headers) {
                headers.push(...customCode.headers);
            }
            if (customCode && customCode.setup) {
                setupCode.push(`    ${customCode.setup}`);
            }
        }

        // 3. Dynamic GPIO Init
        if (usedGpioPins.size > 0) {
            setupCode.push(`    // Auto-generated GPIO Init
    ${Array.from(usedGpioPins).map(pin => `gpio_init(${pin}); gpio_set_dir(${pin}, GPIO_OUT);`).join('\n    ')}`);
        }

        // 4. Process Blocks
        if (blocks.length > 0) {
            loopCode.push('        // --- Visual Builder Sequence ---');
            for (const block of blocks) {
                if (SETUP_TEMPLATES[block.type]) {
                    setupCode.push(SETUP_TEMPLATES[block.type](block.params));
                } else if (block.type !== 'function_def') {
                    // Everything else goes to loop via generateBlockCode, unless it's a function_def
                    const code = await generateBlockCode(block);
                    loopCode.push(code);
                }
            }
        }

        // 5. Generate User-Defined Functions
        const functionDefs = blocks.filter(b => b.type === 'function_def' && b.params.name);
        let functionCode = [];
        for (const fn of functionDefs) {
            const fnName = fn.params.name;
            const innerBlocks = fn.params.innerBlocks || [];
            const fnBody = [];
            for (const b of innerBlocks) {
                fnBody.push(await generateBlockCode(b));
            }

            if (fnBody.length === 0) fnBody.push('    // Empty function');

            functionCode.push(`// User-defined function: ${fnName}\nvoid ${fnName}() {\n${fnBody.join('\n')}\n}`);
        }

        headers = [...new Set(headers)];
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
        return this.generateCMakeListsOriginal(projectName, config);
    }

    // Preserving original CMake logic but avoiding duplication in this Replace call
    // Actually, I need to provide the full class since I am replacing the method.
    // I will just copy the original generateCMakeLists here.
    generateCMakeListsOriginal(projectName, config) {
        const modules = Array.isArray(config) ? config : (config.modules || []);
        const blocks = !Array.isArray(config) && config.blocks ? config.blocks : [];
        let libs = new Set(['pico_stdlib']);

        modules.forEach(mod => {
            if (mod === 'multicore') libs.add('pico_multicore');
            else libs.add(`hardware_${mod.toLowerCase()}`);
        });

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
