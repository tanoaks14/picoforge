#include <iostream>
#include <cassert>
#include "../src/core/module_registry.h"
#include "../src/core/module_factory.h"
#include "../src/core/module.h"

using namespace picoforge;

void testModuleRegistration() {
    registerAllModules();
    
    auto& factory = ModuleFactory::instance();
    
    // Test GPIO
    auto gpio = factory.create("gpio");
    assert(gpio != nullptr);
    assert(gpio->id() == "gpio");
    std::cout << "✓ GPIO module registered\n";
    
    // Test PWM
    auto pwm = factory.create("pwm");
    assert(pwm != nullptr);
    assert(pwm->id() == "pwm");
    std::cout << "✓ PWM module registered\n";
    
    // Test Timer
    auto timer = factory.create("timer");
    assert(timer != nullptr);
    assert(timer->id() == "timer");
    std::cout << "✓ Timer module registered\n";
    
    // Test ADC
    auto adc = factory.create("adc");
    assert(adc != nullptr);
    assert(adc->id() == "adc");
    std::cout << "✓ ADC module registered\n";
    
    // Test UART
    auto uart = factory.create("uart");
    assert(uart != nullptr);
    assert(uart->id() == "uart");
    std::cout << "✓ UART module registered\n";
    
    // Test I2C
    auto i2c = factory.create("i2c");
    assert(i2c != nullptr);
    assert(i2c->id() == "i2c");
    std::cout << "✓ I2C module registered\n";
    
    // Test SPI
    auto spi = factory.create("spi");
    assert(spi != nullptr);
    assert(spi->id() == "spi");
    std::cout << "✓ SPI module registered\n";
    
    // Test PIO
    auto pio = factory.create("pio");
    assert(pio != nullptr);
    assert(pio->id() == "pio");
    std::cout << "✓ PIO module registered\n";
    
    // Test DMA
    auto dma = factory.create("dma");
    assert(dma != nullptr);
    assert(dma->id() == "dma");
    std::cout << "✓ DMA module registered\n";
    
    // Test Multicore
    auto multicore = factory.create("multicore");
    assert(multicore != nullptr);
    assert(multicore->id() == "multicore");
    std::cout << "✓ Multicore module registered\n";
}

void testUnknownModule() {
    auto unknown = ModuleFactory::instance().create("unknown");
    assert(unknown == nullptr);
    std::cout << "✓ Unknown module returns nullptr\n";
}
