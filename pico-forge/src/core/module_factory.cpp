#include "module_factory.h"

namespace picoforge {

ModuleFactory& ModuleFactory::instance() {
    static ModuleFactory inst;
    return inst;
}

void ModuleFactory::registerModule(const std::string& type, CreateFn creator) {
    creators_[type] = creator;
}

ModulePtr ModuleFactory::create(const std::string& type) const {
    auto it = creators_.find(type);
    if (it == creators_.end()) {
        return nullptr;
    }
    return it->second();
}

}  // namespace picoforge
