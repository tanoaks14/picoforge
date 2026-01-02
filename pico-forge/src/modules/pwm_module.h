#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct PwmConfig {
    int pin;
    int freq_hz;
    double duty_pct;  // 0-100
};

class PwmModule : public IModule {
public:
    PwmModule() : cfg_{0, 1000, 50} {}
    explicit PwmModule(PwmConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override { 
        if (cfg_.pin == 0 && cfg_.freq_hz == 1000) return "pwm"; // default
        return "pwm_" + std::to_string(cfg_.pin); 
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"hardware/pwm"}; }

private:
    PwmConfig cfg_;
};

}  // namespace picoforge
