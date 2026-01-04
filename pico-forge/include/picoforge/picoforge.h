#pragma once



#include "picoforge/version.h"


#include "../../src/core/module.h"
#include "../../src/core/code_generator.h"
#include "../../src/core/dependency_injector.h"
#include "../../src/core/code_injector.h"
#include "../../src/core/module_factory.h"
#include "../../src/core/module_registry.h"


#include "../../src/generators/main_generator.h"
#include "../../src/generators/cmake_generator.h"


#include "../../src/config/config_parser.h"
#include "../../src/config/config_validator.h"


#include "../../src/utils/logger.h"
#include "../../src/utils/string_utils.h"
#include "../../src/utils/file_utils.h"
#include "../../src/utils/error_codes.h"

namespace picoforge {
    
    inline void initialize() {
        registerAllModules();
    }
}
