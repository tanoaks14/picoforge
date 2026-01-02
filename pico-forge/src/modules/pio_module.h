#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct PioConfig {
    std::string name;
    std::string preset; // ws2812, uart, spi, i2c, or empty for custom
    int sm_count;
    int data_pin;
};

class PioModule : public IModule {
public:
    PioModule() : cfg_{"pio0", "", 1, 0} {}
    explicit PioModule(PioConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override { 
        if (cfg_.name == "pio0" && cfg_.preset.empty()) return "pio"; // default
        return "pio_" + cfg_.name; 
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"hardware/pio"}; }

private:
    PioConfig cfg_;
};

}  // namespace picoforge
