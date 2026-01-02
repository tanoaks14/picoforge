#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct MulticoreConfig {
    bool enable;
    std::string core1_entry; // function name for core1 main
};

class MulticoreModule : public IModule {
public:
    MulticoreModule() : cfg_{true, "core1_entry"} {}
    explicit MulticoreModule(MulticoreConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override { return "multicore"; }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"pico/multicore"}; }

private:
    MulticoreConfig cfg_;
};

}  // namespace picoforge
