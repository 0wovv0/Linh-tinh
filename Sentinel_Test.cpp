#include <stdio.h>
#include "sntl_lg_api.h"

int main() {
    sntl_lg_handle_t handle = NULL;
    sntl_lg_status_t status;
    const char *vendor_code = "your_vendor_code_here"; /* Thay bằng mã nhà cung cấp thực tế */
    const char *license_definition = "<license_definition_xml>"; /* XML định nghĩa giấy phép */

    /* Khởi tạo phiên làm việc */
    status = sntl_lg_initialize(NULL, &handle);
    if (status != SNTL_LG_STATUS_OK) {
        printf("Initialization failed! Status: %d\n", status);
        return 1;
    }

    /* Bắt đầu tạo giấy phép */
    status = sntl_lg_start(handle, vendor_code, 0, NULL);
    if (status != SNTL_LG_STATUS_OK) {
        printf("Start failed! Status: %d\n", status);
        sntl_lg_cleanup(handle);
        return 1;
    }

    /* Tạo giấy phép */
    char *v2c_data = NULL;
    status = sntl_lg_generate_license(handle, license_definition, &v2c_data);
    if (status == SNTL_LG_STATUS_OK) {
        printf("License generated! V2C data: %s\n", v2c_data);
        /* Lưu v2c_data vào tệp .v2c để áp dụng cho khóa */
    } else {
        printf("License generation failed! Status: %d\n", status);
    }

    /* Dọn dẹp */
    sntl_lg_cleanup(handle);
    if (v2c_data) sntl_lg_free_memory(v2c_data);

    return 0;
}