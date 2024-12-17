> Nếu có chỉnh sửa thư viện và muốn build code mới
> Do package cũ lúc install nó copy nhiều file dư thừa khá nặng nên viết lệnh này để chỉ lấy những file cần thiết

**B1**: copy đường dẫn của dự án dip_mobile để vào biến FOLDER_MAIN (cd vào dự án gõ `pwd` => VD: `/Users/longnguyen/difisoft/dip_mobile`)

**B2**: cấp quyền cho file **gen_local_module.sh:** chạy: "`chmod +rx gen_local_module.sh`"

**B3**: chạy "`sh gen_local_module.sh`"

> ở đây sẽ chạy build và copy những file cần thiết và đẩy qua bên folder 10tap_editor trong source dip_mobile và chạy install lại
