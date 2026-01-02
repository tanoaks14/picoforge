#include "../core/module_factory.h"
#include "../modules/gpio_module.h"
#include "../modules/pwm_module.h"
#include "../modules/timer_module.h"
#include "../modules/adc_module.h"
#include "../modules/uart_module.h"
#include "../modules/i2c_module.h"
#include "../modules/spi_module.h"
#include "../modules/pio_module.h"
#include "../modules/dma_module.h"
#include "../modules/multicore_module.h"

namespace picoforge {

void registerAllModules() {
    auto& factory = ModuleFactory::instance();
    
    factory.registerModule("gpio", []() -> ModulePtr {
        return std::make_shared<GpioModule>();
    });
    
    factory.registerModule("pwm", []() -> ModulePtr {
        return std::make_shared<PwmModule>();
    });
    
    factory.registerModule("timer", []() -> ModulePtr {
        return std::make_shared<TimerModule>();
    });
    
    factory.registerModule("adc", []() -> ModulePtr {
        return std::make_shared<AdcModule>();
    });
    
    factory.registerModule("uart", []() -> ModulePtr {
        return std::make_shared<UartModule>();
    });
    
    factory.registerModule("i2c", []() -> ModulePtr {
        return std::make_shared<I2cModule>();
    });
    
    factory.registerModule("spi", []() -> ModulePtr {
        return std::make_shared<SpiModule>();
    });
    
    factory.registerModule("pio", []() -> ModulePtr {
        return std::make_shared<PioModule>();
    });
    
    factory.registerModule("dma", []() -> ModulePtr {
        return std::make_shared<DmaModule>();
    });
    
    factory.registerModule("multicore", []() -> ModulePtr {
        return std::make_shared<MulticoreModule>();
    });
}

}  // namespace picoforge
