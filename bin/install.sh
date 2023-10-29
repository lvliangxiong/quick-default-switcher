#!/bin/bash

install_dir="/usr/local/bin"
binary_name="defaultbrowser"

curl -LJO "https://github.com/lvliangxiong/quick-default-switcher/raw/main/bin/defaultbrowser"

if [ -f "${binary_name}" ]; then
    sudo mv "${binary_name}" "${install_dir}/${binary_name}"
    sudo chmod +x "${install_dir}/${binary_name}"
    echo "${binary_name} installed in ${install_dir}"
else
    echo "failed"
fi
