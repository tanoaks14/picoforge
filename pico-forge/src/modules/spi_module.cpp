#include "spi_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_spi_id(int id) { return id == 0 || id == 1; }
bool is_valid_pin(int pin) { return pin >= 0 && pin <= 29; }
bool is_valid_speed(int speed) { return speed > 0 && speed <= 62500000; }
bool is_valid_mode(int mode) { return mode >= 0 && mode <= 3; }
}

bool SpiModule::validate() const {
    return is_valid_spi_id(cfg_.id) && is_valid_pin(cfg_.sck) &&
           is_valid_pin(cfg_.mosi) && is_valid_pin(cfg_.miso) &&
           is_valid_speed(cfg_.speed_hz) && is_valid_mode(cfg_.mode);
}

std::string SpiModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "spi_init(spi" << cfg_.id << ", " << cfg_.speed_hz << ");\n";
    oss << "gpio_set_function(" << cfg_.sck << ", GPIO_FUNC_SPI);\n";
    oss << "gpio_set_function(" << cfg_.mosi << ", GPIO_FUNC_SPI);\n";
    oss << "gpio_set_function(" << cfg_.miso << ", GPIO_FUNC_SPI);\n";
    oss << "spi_set_format(spi" << cfg_.id << ", 8, " << cfg_.mode << ", SPI_MSB_FIRST, false);\n";
    return oss.str();
}

std::string SpiModule::generateHeaderCode() const {
    return "#include <hardware/spi.h>\n";
}

}  // namespace picoforge
