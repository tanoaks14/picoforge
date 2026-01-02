#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct I2cConfig {
    int id;        // 0 or 1
    int sda;
    int scl;
    int speed_hz;
    bool pullups;
};

class I2cModule : public IModule {
public:
    I2cModule() : cfg_{0, 0, 1, 100000, false} {}
    explicit I2cModule(I2cConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override { 
        if (cfg_.id == 0 && cfg_.speed_hz == 100000) return "i2c"; // default
        return "i2c_" + std::to_string(cfg_.id); 
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"hardware/i2c"}; }

private:
    I2cConfig cfg_;
};

}  // namespace picoforge
