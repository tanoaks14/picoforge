#include "pio_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_pin(int pin) { return pin >= 0 && pin <= 29; }
bool is_valid_sm_count(int count) { return count > 0 && count <= 4; }
bool is_valid_preset(const std::string& preset) {
    return preset.empty() || preset == "ws2812" || preset == "uart" || 
           preset == "spi" || preset == "i2c";
}
}

bool PioModule::validate() const {
    return !cfg_.name.empty() && is_valid_sm_count(cfg_.sm_count) &&
           is_valid_pin(cfg_.data_pin) && is_valid_preset(cfg_.preset);
}

std::string PioModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "// PIO program: " << cfg_.name << "\n";
    oss << "PIO pio = pio0;\n";
    oss << "uint sm = pio_claim_unused_sm(pio, true);\n";
    
    if (cfg_.preset == "ws2812") {
        oss << "// WS2812 preset on pin " << cfg_.data_pin << "\n";
        oss << "pio_gpio_init(pio, " << cfg_.data_pin << ");\n";
    } else if (!cfg_.preset.empty()) {
        oss << "// Preset: " << cfg_.preset << " on pin " << cfg_.data_pin << "\n";
    } else {
        oss << "// Custom PIO program init placeholder\n";
    }
    
    return oss.str();
}

std::string PioModule::generateHeaderCode() const {
    return "#include <hardware/pio.h>\n";
}

}  // namespace picoforge
