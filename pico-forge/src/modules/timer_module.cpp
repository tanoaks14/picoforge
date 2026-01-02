#include "timer_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_interval(int ms) { return ms > 0 && ms <= 60 * 60 * 1000; }
bool is_non_empty(const std::string& s) { return !s.empty(); }
}

bool TimerModule::validate() const {
    return is_non_empty(cfg_.id) && is_valid_interval(cfg_.interval_ms) && is_non_empty(cfg_.callback);
}

std::string TimerModule::generateInitCode() const {
    std::ostringstream oss;
    const auto type = cfg_.periodic ? "true" : "false";
    oss << "add_alarm_in_ms(" << cfg_.interval_ms << ", " << cfg_.callback << ", nullptr, " << type << ");\n";
    return oss.str();
}

std::string TimerModule::generateHeaderCode() const {
    return "#include <pico/time.h>\n";
}

}  // namespace picoforge
