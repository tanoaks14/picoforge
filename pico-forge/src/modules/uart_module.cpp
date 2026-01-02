#include "uart_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_uart_id(int id) { return id == 0 || id == 1; }
bool is_valid_baud(int baud) { return baud >= 300 && baud <= 3000000; }
bool is_valid_pin(int pin) { return pin >= 0 && pin <= 29; }
bool is_valid_parity(const std::string& p) {
    return p == "none" || p == "even" || p == "odd";
}
}

bool UartModule::validate() const {
    return is_valid_uart_id(cfg_.id) && is_valid_baud(cfg_.baud) &&
           is_valid_pin(cfg_.tx_pin) && is_valid_pin(cfg_.rx_pin) &&
           is_valid_parity(cfg_.parity);
}

std::string UartModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "uart_init(uart" << cfg_.id << ", " << cfg_.baud << ");\n";
    oss << "gpio_set_function(" << cfg_.tx_pin << ", GPIO_FUNC_UART);\n";
    oss << "gpio_set_function(" << cfg_.rx_pin << ", GPIO_FUNC_UART);\n";
    if (cfg_.parity != "none") {
        oss << "uart_set_format(uart" << cfg_.id << ", 8, 1, UART_PARITY_" 
            << (cfg_.parity == "even" ? "EVEN" : "ODD") << ");\n";
    }
    return oss.str();
}

std::string UartModule::generateHeaderCode() const {
    return "#include <hardware/uart.h>\n";
}

}  // namespace picoforge
