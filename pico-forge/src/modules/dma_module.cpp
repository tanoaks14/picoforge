#include "dma_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_channel(int ch) { return ch >= -1 && ch <= 11; }
bool is_valid_data_size(int sz) { return sz == 8 || sz == 16 || sz == 32; }
}

bool DmaModule::validate() const {
    return is_valid_channel(cfg_.channel) && is_valid_data_size(cfg_.data_size);
}

std::string DmaModule::generateInitCode() const {
    std::ostringstream oss;
    
    if (cfg_.channel < 0) {
        oss << "int dma_chan = dma_claim_unused_channel(true);\n";
    } else {
        oss << "int dma_chan = " << cfg_.channel << ";\n";
        oss << "dma_channel_claim(dma_chan);\n";
    }
    
    oss << "dma_channel_config c = dma_channel_get_default_config(dma_chan);\n";
    oss << "channel_config_set_transfer_data_size(&c, DMA_SIZE_" << cfg_.data_size << ");\n";
    oss << "channel_config_set_read_increment(&c, " << (cfg_.src_inc ? "true" : "false") << ");\n";
    oss << "channel_config_set_write_increment(&c, " << (cfg_.dst_inc ? "true" : "false") << ");\n";
    
    if (!cfg_.dreq.empty() && cfg_.dreq != "none") {
        oss << "// DREQ: " << cfg_.dreq << " (configure manually)\n";
    }
    
    return oss.str();
}

std::string DmaModule::generateHeaderCode() const {
    return "#include <hardware/dma.h>\n";
}

}  // namespace picoforge
