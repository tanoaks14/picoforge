#include <cassert>
#include <iostream>
#include <string>

#include "../../src/generators/main_generator.h"
#include "../../src/modules/gpio_module.h"
#include "../../src/modules/pwm_module.h"
#include "../../src/modules/timer_module.h"
#include "../../src/modules/adc_module.h"

using namespace picoforge;

void testMainGenerator() {
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "up"}));
    modules.push_back(std::make_shared<PwmModule>(PwmConfig{2, 1000, 50.0}));
    modules.push_back(std::make_shared<TimerModule>(TimerConfig{"heartbeat", 500, true, "on_heartbeat"}));
    modules.push_back(std::make_shared<AdcModule>(AdcConfig{26, 4, false}));

    MainGenerator gen;
    auto code = gen.generate(modules);

    assert(code.headers.find("hardware/gpio") != std::string::npos);
    assert(code.headers.find("hardware/pwm") != std::string::npos);
    assert(code.headers.find("pico/time") != std::string::npos);
    assert(code.headers.find("hardware/adc") != std::string::npos);

    assert(code.mainBody.find("gpio_init(15)") != std::string::npos);
    assert(code.mainBody.find("pwm_set_enabled") != std::string::npos);
    assert(code.mainBody.find("add_alarm_in_ms(500") != std::string::npos);
    assert(code.mainBody.find("adc_gpio_init(26)") != std::string::npos);

    std::cout << "✓ Main generator test passed\n";
}
