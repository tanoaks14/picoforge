#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct UartConfig {
    int id;           // 0 or 1
    int baud;
    int tx_pin;
    int rx_pin;
    std::string parity; // "none", "even", "odd"
};

class UartModule : public IModule {
public:
    UartModule() : cfg_{0, 115200, 0, 1, "none"} {}
    explicit UartModule(UartConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override { 
        if (cfg_.id == 0 && cfg_.baud == 115200) return "uart"; // default
        return "uart_" + std::to_string(cfg_.id); 
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"hardware/uart"}; }

private:
    UartConfig cfg_;
};

}  // namespace picoforge
