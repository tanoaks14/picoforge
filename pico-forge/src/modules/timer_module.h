#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct TimerConfig {
    std::string id;
    int interval_ms;
    bool periodic;
    std::string callback;
};

class TimerModule : public IModule {
public:
    TimerModule() : cfg_{"timer0", 1000, false, ""} {}
    explicit TimerModule(TimerConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override { 
        if (cfg_.id == "timer0") return "timer"; // default
        return "timer_" + cfg_.id; 
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"pico/time.h"}; }

private:
    TimerConfig cfg_;
};

}  // namespace picoforge
