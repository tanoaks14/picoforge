#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

struct DmaConfig {
    int channel;      
    int data_size;    
    bool src_inc;
    bool dst_inc;
    std::string dreq; 
};

class DmaModule : public IModule {
public:
    DmaModule() : cfg_{0, 32, false, false, "none"} {}
    explicit DmaModule(DmaConfig cfg) : cfg_(std::move(cfg)) {}

    std::string id() const override {
        if (cfg_.channel == 0 && cfg_.dreq == "none") return "dma"; 
        return cfg_.channel >= 0 ? "dma_" + std::to_string(cfg_.channel) : "dma_auto";
    }

    bool validate() const override;

    std::string generateInitCode() const override;

    std::string generateHeaderCode() const override;

    std::vector<std::string> dependencies() const override { return {"hardware/dma"}; }

private:
    DmaConfig cfg_;
};

}  
