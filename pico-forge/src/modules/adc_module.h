#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct AdcConfig {
    int pin;          
    int samples;      
    bool temperature; 
};

class AdcModule : public IModule {
public:
    AdcModule() : cfg_{0, 1, false} {}
    explicit AdcModule(AdcConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override {
        if (!cfg_.temperature && cfg_.pin == 0) return "adc"; 
        return cfg_.temperature ? "adc_temp" : "adc_" + std::to_string(cfg_.pin);
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"hardware/adc"}; }

private:
    AdcConfig cfg_;
};

}  
