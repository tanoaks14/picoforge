#pragma once

#include <functional>
#include <memory>
#include <string>
#include <unordered_map>
#include <utility>

namespace picoforge {

class DependencyInjector {
public:
    template <typename T>
    void registerFactory(const std::string& key, std::function<std::shared_ptr<T>()> factory) {
        factories_[key] = [factory]() { return factory(); };
    }

    template <typename T>
    std::shared_ptr<T> resolve(const std::string& key) const {
        auto it = factories_.find(key);
        if (it == factories_.end()) {
            return nullptr;
        }
        return std::static_pointer_cast<T>(it->second());
    }

private:
    std::unordered_map<std::string, std::function<std::shared_ptr<void>()>> factories_;
};

}  // namespace picoforge
