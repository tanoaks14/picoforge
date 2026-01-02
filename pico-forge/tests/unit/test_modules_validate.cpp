#include <cassert>
#include <iostream>

#include "../../src/modules/gpio_module.h"
#include "../../src/modules/pwm_module.h"
#include "../../src/modules/timer_module.h"
#include "../../src/modules/adc_module.h"
#include "../../src/modules/uart_module.h"
#include "../../src/modules/i2c_module.h"
#include "../../src/modules/spi_module.h"
#include "../../src/modules/pio_module.h"
#include "../../src/modules/dma_module.h"
#include "../../src/modules/multicore_module.h"

using namespace picoforge;

void testGpioValidation() {
    GpioModule gpio_ok({15, "output", "none"});
    assert(gpio_ok.validate());
    GpioModule gpio_bad_pin({99, "output", "none"});
    assert(!gpio_bad_pin.validate());
    std::cout << "✓ GPIO validation tests passed\n";
}

void testPwmValidation() {
    PwmModule pwm_ok({2, 1000, 50.0});
    assert(pwm_ok.validate());
    PwmModule pwm_bad({2, 1000, 150.0});
    assert(!pwm_bad.validate());
    std::cout << "✓ PWM validation tests passed\n";
}

void testTimerValidation() {
    TimerModule timer_ok({"heartbeat", 500, true, "on_heartbeat"});
    assert(timer_ok.validate());
    TimerModule timer_bad({"heartbeat", -1, true, "on_heartbeat"});
    assert(!timer_bad.validate());
    std::cout << "✓ Timer validation tests passed\n";
}

void testAdcValidation() {
    AdcModule adc_ok({26, 4, false});
    assert(adc_ok.validate());
    AdcModule adc_bad_pin({10, 4, false});
    assert(!adc_bad_pin.validate());
    AdcModule adc_temp({26, 8, true});
    assert(adc_temp.validate());
    AdcModule adc_bad_samples({26, 0, false});
    assert(!adc_bad_samples.validate());
    std::cout << "✓ ADC validation tests passed\n";
}

void testUartValidation() {
    UartModule uart_ok({0, 115200, 0, 1, "none"});
    assert(uart_ok.validate());
    UartModule uart_bad({0, 100, 0, 1, "none"});
    assert(!uart_bad.validate());
    std::cout << "✓ UART validation tests passed\n";
}

void testI2cValidation() {
    I2cModule i2c_ok({1, 18, 19, 400000, true});
    assert(i2c_ok.validate());
    I2cModule i2c_bad({5, 18, 19, 400000, true});
    assert(!i2c_bad.validate());
    std::cout << "✓ I2C validation tests passed\n";
}

void testSpiValidation() {
    SpiModule spi_ok({0, 2, 3, 4, 8000000, 0});
    assert(spi_ok.validate());
    SpiModule spi_bad({0, 2, 3, 4, 8000000, 10});
    assert(!spi_bad.validate());
    std::cout << "✓ SPI validation tests passed\n";
}

// Note: PIO, DMA, Multicore tests moved to main integration test suite
// These test functions provide stub implementations for the test runner
