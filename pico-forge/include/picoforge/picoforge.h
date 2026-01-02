#pragma once

/**
 * @file picoforge.h
 * @brief Main public API header for PicoForge
 * 
 * Include this single header to access the complete PicoForge API.
 */

#include "picoforge/version.h"

// Core interfaces
#include "../../src/core/module.h"
#include "../../src/core/code_generator.h"
#include "../../src/core/dependency_injector.h"
#include "../../src/core/code_injector.h"
#include "../../src/core/module_factory.h"
#include "../../src/core/module_registry.h"

// Generators
#include "../../src/generators/main_generator.h"
#include "../../src/generators/cmake_generator.h"

// Configuration
#include "../../src/config/config_parser.h"
#include "../../src/config/config_validator.h"

// Utilities
#include "../../src/utils/logger.h"
#include "../../src/utils/string_utils.h"
#include "../../src/utils/file_utils.h"
#include "../../src/utils/error_codes.h"

namespace picoforge {
    /**
     * @brief Initialize PicoForge system
     * 
     * Registers all built-in modules and prepares the system for use.
     */
    inline void initialize() {
        registerAllModules();
    }
}
