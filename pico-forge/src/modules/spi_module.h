#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct SpiConfig {
    int id;       // 0 or 1
    int sck;
    int mosi;
    int miso;
    int speed_hz;
    int mode;     // 0-3
};

class SpiModule : public IModule {
public:
    SpiModule() : cfg_{0, 18, 19, 16, 1000000, 0} {}
    explicit SpiModule(SpiConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override { 
        if (cfg_.id == 0 && cfg_.speed_hz == 1000000) return "spi"; // default
        return "spi_" + std::to_string(cfg_.id); 
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"hardware/spi"}; }

private:
    SpiConfig cfg_;
};

}  // namespace picoforge
