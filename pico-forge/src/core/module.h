#pragma once

#include <memory>
#include <string>
#include <vector>

namespace picoforge {

class IModule {
public:
    virtual ~IModule() = default;

    virtual std::string id() const = 0;
    virtual bool validate() const = 0;
    virtual std::string generateInitCode() const = 0;
    virtual std::string generateHeaderCode() const = 0;
    virtual std::vector<std::string> dependencies() const = 0;
};

using ModulePtr = std::shared_ptr<IModule>;
using ModuleList = std::vector<ModulePtr>;

}  // namespace picoforge
