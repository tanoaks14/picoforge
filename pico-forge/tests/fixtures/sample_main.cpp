#include <stdio.h>
#include "pico/stdlib.h"


#include "my_custom_lib.h"


int main() {
    stdio_init_all();
    
    
    
    
    while (true) {
        printf("Custom user code running\n");
        sleep_ms(1000);
    }
    
    
    return 0;
}
