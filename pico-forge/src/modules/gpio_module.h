#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct GpioConfig {
    int pin;
    std::string direction;  // "input" or "output"
    std::string pull;       // "up", "down", "none"
};

class GpioModule : public IModule {
public:
    GpioModule() : cfg_{0, "output", "none"} {}
    explicit GpioModule(GpioConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override { 
        if (cfg_.pin == 0 && cfg_.direction == "output") return "gpio"; // default
        return "gpio_" + std::to_string(cfg_.pin); 
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"hardware/gpio"}; }

private:
    GpioConfig cfg_;
};

}  // namespace picoforge
