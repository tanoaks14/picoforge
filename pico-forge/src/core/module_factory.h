#pragma once

#include <functional>
#include <memory>
#include <string>
#include <unordered_map>

#include "module.h"

namespace picoforge {

class ModuleFactory {
public:
    using CreateFn = std::function<ModulePtr()>;
    
    static ModuleFactory& instance();
    
    void registerModule(const std::string& type, CreateFn creator);
    ModulePtr create(const std::string& type) const;
    
private:
    ModuleFactory() = default;
    std::unordered_map<std::string, CreateFn> creators_;
};

}  // namespace picoforge
