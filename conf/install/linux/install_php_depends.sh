install_php_depends(){
    if check_sys packageManager apt; then
        apt_depends=(autoconf bison pkg-config libxml2-dev libsqlite3-dev zlib1g-dev)
        echo "Starting to install dependencies packages for PHP..."
        for depend in ${apt_depends[@]}
        do
            error_detect_depends "apt-get -y install ${depend}"
        done
        echo "Install dependencies packages for PHP completed..."

    elif check_sys packageManager yum; then
        yum_depends=(autoconf bison pkg-config libxml2-devel sqlite-devel zlib zlib-devel)
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
    install_libiconv
    install_re2c
    install_oniguruma
}

# Download a file
# $1: filename
# $2: url
download_file(){
    local cur_dir=$(pwd)
    if [ -s "$1" ]; then
        echo "$1 [found]"
    else
        echo "$1 not found, download now..."
        wget --no-check-certificate -cv -t3 -T60 -O ${1} ${2}
        if [ $? -eq 0 ]; then
            echo "$1 download completed..."
        else
            rm -f "$1"
            echo "Failed to download $1, please download it to ${cur_dir} directory manually and try again."
            exit 1
        fi
    fi
}

parallel_make(){
    local para="$1"
    local cpunum=$(cat /proc/cpuinfo | grep 'processor' | wc -l)

    if [ ${cpunum} -eq 1 ]; then
        [ "${para}" == "" ] && make || make "${para}"
    else
        [ "${para}" == "" ] && make -j${cpunum} || make -j${cpunum} "${para}"
    fi
}

install_libiconv(){
    if [ ! -e "/usr/local/bin/iconv" ]; then
        cd ${cur_dir}
        echo "libiconv install start..."

        rm "libiconv-1.16.tar.gz"
        rm -rf "libiconv-1.16"

        download_file "libiconv-1.16.tar.gz" "https://ftp.gnu.org/pub/gnu/libiconv/libiconv-1.16.tar.gz"

        tar -xf "libiconv-1.16.tar.gz"
        cd "libiconv-1.16"

        error_detect "./configure"
        error_detect "parallel_make"
        error_detect "make install"
        echo "libiconv install completed..."
    fi
}

install_re2c(){
    if [ ! -e "/usr/local/bin/re2c" ]; then
        cd ${cur_dir}
        echo "re2c install start..."

        rm "re2c-1.3.tar.xz"
        rm -rf "re2c-1.3"

        download_file "re2c-1.3.tar.xz" "https://github.com/skvadrik/re2c/releases/download/1.3/re2c-1.3.tar.xz"

        tar -xf "re2c-1.3.tar.xz"
        cd "re2c-1.3"

        error_detect "./configure"
        error_detect "make"
        error_detect "make install"

        echo "re2c install completed..."
    fi
}

install_oniguruma(){
  if [! -e "/usr/local/bin/onig-config"]; then
      cd ${cur_dir}
      echo "oniguruma install start..."

      rm "onig-6.9.5.tar.gz"
      rm -rf "onig-6.9.5"

      download_file "onig-6.9.5.tar.gz" "https://github.com/kkos/oniguruma/releases/download/v6.9.5/onig-6.9.5.tar.gz"

      tar -xf "onig-6.9.5.tar.gz"
      cd "onig-6.9.5"

      error_detect "./configure"
      error_detect "make"
      error_detect "make install"
      echo "oniguruma install completed..."
  fi
}
