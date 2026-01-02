cmake_minimum_required(VERSION 3.12)

project(PicoForge
    VERSION 1.0.0
    LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Compiler warnings (portable set)
if(MSVC)
    add_compile_options(/W4 /permissive-)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# Core library
add_library(pico_forge_core
    src/core/module.cpp
    src/core/code_generator.cpp
    src/core/code_injector.cpp
    src/core/dependency_injector.cpp
    src/core/module_factory.cpp
    src/core/module_registry.cpp
    src/config/config_parser.cpp
    src/config/config_validator.cpp
    src/utils/logger.cpp
    src/utils/string_utils.cpp
    src/utils/file_utils.cpp
    src/modules/adc_module.cpp
    src/modules/gpio_module.cpp
    src/modules/pwm_module.cpp
    src/modules/timer_module.cpp
    src/modules/uart_module.cpp
    src/modules/i2c_module.cpp
    src/modules/spi_module.cpp
    src/modules/pio_module.cpp
    src/modules/dma_module.cpp
    src/modules/multicore_module.cpp
    src/generators/main_generator.cpp
    src/generators/cmake_generator.cpp
)

target_include_directories(pico_forge_core
    PUBLIC
        ${PROJECT_SOURCE_DIR}/include
    PRIVATE
        ${PROJECT_SOURCE_DIR}/src
)

# CLI executable
add_executable(pico-forge
    src/main.cpp
)

target_link_libraries(pico-forge PRIVATE pico_forge_core)

# Tests (lightweight asserts)
enable_testing()

# Unit tests
add_executable(pico-forge-tests
    tests/unit/test_runner.cpp
    tests/unit/test_modules_validate.cpp
    tests/unit/test_main_generator.cpp
    tests/unit/test_config_parser.cpp
    tests/unit/test_code_injector.cpp
    tests/unit/test_cmake_generator.cpp
    tests/unit/test_config_validator.cpp
    tests/unit/test_module_registry.cpp
    tests/unit/test_template_generation.cpp
    tests/unit/test_code_generation_correctness.cpp
)
target_link_libraries(pico-forge-tests PRIVATE pico_forge_core)
target_compile_definitions(pico-forge-tests PRIVATE FIXTURES_PATH="${CMAKE_SOURCE_DIR}/tests/fixtures")
add_test(NAME pico-forge-unit COMMAND pico-forge-tests)

# Integration tests
add_executable(pico-forge-integration-tests
    tests/integration/test_full_generation.cpp
)
target_link_libraries(pico-forge-integration-tests PRIVATE pico_forge_core)
target_compile_definitions(pico-forge-integration-tests PRIVATE FIXTURES_PATH="${CMAKE_SOURCE_DIR}/tests/fixtures")
add_test(NAME pico-forge-integration COMMAND pico-forge-integration-tests)

# Enable folders for IDEs
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
