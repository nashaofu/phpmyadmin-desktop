#Intall PHP
install_php(){
    local php_location=${1}
    echo "php_location: ${php_location}"

    php_configure_args="--prefix=${php_location} \
    --with-config-file-path=${php_location}/etc \
    --with-mysqli \
    --enable-mbstring"

    #Install PHP depends
    install_php_depends

    unset LD_LIBRARY_PATH
    unset CPPFLAGS
    ldconfig

    error_detect "./configure ${php_configure_args}"
    error_detect "make install"
}


install_php_depends(){
    if check_sys packageManager apt; then
        apt_depends=(pkg-config libxml2-dev libonig-dev zlib1g-dev libsqlite3-dev)
        echo "Starting to install dependencies packages for PHP..."
        for depend in ${apt_depends[@]}
        do
            error_detect_depends "apt-get -y install ${depend}"
        done
        echo "Install dependencies packages for PHP completed..."

    elif check_sys packageManager yum; then
        local oniguruma_devel="http://mirror.centos.org/centos/8/PowerTools/x86_64/os/Packages/oniguruma-devel-6.8.2-1.el8.${arch}.rpm"
        yum_depends=(pkg-config libxml2-devel sqlite-devel ${oniguruma_devel})
        echo "Starting to install dependencies packages for PHP..."
        for depend in ${yum_depends[@]}
        do
            error_detect_depends "yum -y install ${depend}"
        done
        if yum list | grep "libc-client-devel" > /dev/null 2>&1; then
            error_detect_depends "yum -y install libc-client-devel"
        elif yum list | grep "uw-imap-devel" > /dev/null 2>&1; then
            error_detect_depends "yum -y install uw-imap-devel"
        else
            echo "There is no rpm package libc-client-devel or uw-imap-devel, please check it and try again."
        fi
        echo "Install dependencies packages for PHP completed..."
    fi
}
