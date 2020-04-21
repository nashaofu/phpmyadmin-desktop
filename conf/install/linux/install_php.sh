#Intall PHP
install_php(){
    local php_filename=${1}
    local php_location=${2}
    local filename=$(basename $php_filename .tar.gz)
    local basedir=$(dirname $php_filename)
    local sourcedir=$basedir/$filename

    cd ${cur_dir}

    php_configure_args="--prefix=${php_location} \
    --with-config-file-path=${php_location}/etc \
    --with-mysqli \
    --enable-mbstring"

    cd ${basedir}
    # 清理文件
    rm -rf $sourcedir

    tar zxf $php_filename
    cd $sourcedir

    error_detect "./configure ${php_configure_args}"
    error_detect "parallel_make ZEND_EXTRA_LIBS='-liconv'"
    error_detect "make install"
}
