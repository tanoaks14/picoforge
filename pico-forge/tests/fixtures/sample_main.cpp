#include <stdio.h>
#include "pico/stdlib.h"

// [USER_CODE] includes
#include "my_custom_lib.h"
// [USER_CODE] END

int main() {
    stdio_init_all();
    
    // Generated initialization code will go here
    
    // [USER_CODE] main_loop
    while (true) {
        printf("Custom user code running\n");
        sleep_ms(1000);
    }
    // [USER_CODE] END
    
    return 0;
}
