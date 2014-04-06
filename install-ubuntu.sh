#!/bin/bash

# Installs dependencies for Fora
# Tested only in Ubuntu. 

help() {
echo "usage: ./install-ubuntu.sh options
options:
  --all               Same as --common --node --coffee --nginx --nginx-conf --host local.foraproject.org --mongodb --gm --config-files --node-modules
  --latest            Same as --common --node-latest --coffee --nginx --nginx-conf --host local.foraproject.org --mongodb-latest --gm --config-files --node-modules

  --node              Install a pre-compiled version of node
  --node-latest       Compile and install the latest node
  --coffee            Compile and install coffee-script, with support for the yield keyword
  --nginx             Install nginx
  --nginx-conf        Copies a sample nginx config file to /etc/nginx/sites-available, and creates a symlink in sites-enabled
  --host hostname     Adds an entry into /etc/hosts. eg: --host test.myforaproj.com
  --mongodb           Install a pre-compiled version of MongoDb
  --mongodb-latest    Compile and install the latest MongoDb  
  --gm                Install Graphics Magick
  --config-files      Creates config files if they don't exist
  --node-modules      Install Node Modules
  --common            Install common libs. 1) inotify-tools

  --help              Print the help screen

Examples:
  ./install-ubuntu.sh --all
  ./install-ubuntu.sh --node --coffee --gm --node-modules"
}

if [ $# -eq 0 ]
  then
    help
    exit 0
fi

if [ "$(whoami)" == "root" ]; then
	echo "This script must not be run as root. It will prompt for password as required."
	exit 1
fi

vercomp () {
    if [[ $1 == $2 ]]
    then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++))
    do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++))
    do
        if [[ -z ${ver2[i]} ]]
        then
            # fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]}))
        then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]}))
        then
            return 2
        fi
    done
    return 0
}

base_dir=$PWD
dont_force=true
common=false
node=false
node_latest=false
coffee=false
nginx=false
nginx_conf=false
hostname="local.foraproject.org"            
mongodb=false
mongodb_latest=false
gm=false
config_files=false
node_modules=false
host=false

MACHINE_TYPE=`uname -m`
if [ ${MACHINE_TYPE} == 'x86_64' ]; then
    x86_64=true
else
    x86_64=false
fi

while :
do
    case $1 in
        -h | --help | -\?)
            help
            exit 0      # This is not an error, User asked help. Don't do "exit 1"
            ;;
        -a | --all)
            common=true
            node=true
            coffee=true
            nginx=true
            nginx_conf=true
            host=true
            mongodb=true
            gm=true
            config_files=true
            node_modules=true
            shift
            ;;
        --latest)
            common=true
            node_latest=true
            coffee=true
            nginx=true
            nginx_conf=true
            host=true
            mongodb_latest=true
            gm=true
            config_files=true
            node_modules=true
            shift
            ;;
        --common)
            common=true
            shift
            ;;
        --node)
            node=true
            shift
            ;;
        --node-latest)
            node_latest=true
            shift
            ;;
        --coffee)
            coffee=true
            shift
            ;;
        --nginx)
            nginx=true
            shift
            ;;
        --nginx-conf)
            nginx_conf=true
            shift
            ;;
        --host)
            host=true
            hostname=$2
            shift 2
            ;;
        --mongodb)
            mongodb=true
            shift
            ;;
        --mongodb-latest)
            mongodb_latest=true
            shift
            ;;
        --gm)
            gm=true
            shift
            ;;
        --config-files)
            config_files=true
            shift
            ;;
        --node-modules)
            node_modules=true
            shift
            ;;
        --force)
            dont_force=false
            shift
            ;;
        -*)
            echo "WARN: Unknown option (ignored): $1" >&2
            shift
            ;;
        *)  # no more options. Stop while loop        
            break
            ;;
    esac
done



install_common() {
    sudo apt-get install inotify-tools
}

if $common ; then
    install_common
fi



install_node() {
    VERSION=0.11.8
    PLATFORM=linux
    if [ x86_64 ] ; then
        ARCH=x64
    else
        ARCH=x86
    fi
    PREFIX="/usr/local"
    sudo apt-get install curl
    sudo sh -c "mkdir -p \"$PREFIX\" && curl http://nodejs.org/dist/v$VERSION/node-v$VERSION-$PLATFORM-$ARCH.tar.gz | tar xzvf - --strip-components=1 -C \"$PREFIX\""
}

#Node version must not be less than 0.11.5
if $node ; then
    if $dont_force && command -v node >/dev/null; then
        node_version=`node -v | grep -o "[0-9].*"`
        vercomp $node_version "0.11.9"
        result=$?
        if [[ $result -le 1 ]] ; then
            echo "Node version $node_version is installed. Update is not needed."
        else
            echo "Node version is $node_version. Will update."
            install_node
        fi
    else
        echo "Node will be installed."
        install_node
    fi
else
    if $node_latest ; then
        sudo apt-get install build-essential            
        sudo apt-get build-dep nodejs
        temp=`mktemp -d`
        echo "Installing bleeding edge nodejs.."
        git clone https://github.com/joyent/node.git $temp
        cd $temp
        ./configure
        make
        sudo make install
        rm -rf $temp
    fi
fi



install_coffee() {    
    temp_cs=`mktemp -d`
    
    echo "Installing standard Coffee-Script compiler.. ($temp_cs)"
    cd $temp_cs
    npm install coffee-script
    export PATH=$PATH:$PWD/node_modules/coffee-script/bin
    temp_new_cs=`mktemp -d`
    git clone https://github.com/alubbe/coffee-script.git $temp_new_cs
    cd $temp_new_cs
    echo "Switching to earlier version (1e377ed59bc4f679863b7543f0c33d1f89dbf6ac), until a parser bug is fixed.."
    git checkout 1e377ed59bc4f679863b7543f0c33d1f89dbf6ac
    npm install mkdirp  
    npm install jison
    echo "Building Coffee-Script"
    cake build:parser  
    cake build 
    echo "Installing Coffee-Script"
    sudo npm install -g mkdirp  
    sudo $temp_cs/node_modules/coffee-script/bin/cake install
    
    rm -rf $temp_cs
    rm -rf $temp_new_cs
}


#coffee-script compiler must support yield
if $coffee ; then
    if $dont_force && command -v coffee >/dev/null; then
	echo $dont_force
        echo "NOTE: While checking for yield support you might see an error... ignore it."
        coffee --nodejs --harmony -e "a = (->* yield 1)"
        if [ "$?" -eq 0 ] ; then
            echo "Coffee-Script is installed and supports yield. Update is not needed."
        else
            echo "Coffee-Script is installed but does not support yield. Will update compiler." 
            install_coffee
        fi
    else
        echo "Coffee-Script will be installed."
        install_coffee
    fi
fi


cd $base_dir


#Install nginx
if $nginx ; then
    if $dont_force && command -v nginx >/dev/null; then
        echo "Nginx is already installed."
    else
        echo "Nginx will be installed."
        sudo apt-get install nginx
    fi
fi


#Install nginx configuration files under /etc/nginx
if $nginx_conf ; then
    if [ ! -f /etc/nginx/sites-available/fora.conf ]; then
	    sudo sh -c "cat nginx.conf.sample | sed -e 's_/path/to/fora_"$PWD"_g' -e 's_fora.host.name_"$hostname"_g' > /etc/nginx/sites-available/fora.conf"
        sudo ln -s /etc/nginx/sites-available/fora.conf /etc/nginx/sites-enabled/fora.conf
        echo "fora.conf copied to /etc/nginx/sites-available and symlinked in sites-enabled"
        sudo /etc/init.d/nginx restart
    else
        echo "fora.conf exists in /etc/nginx/sites-*/. Will not overwrite, you must delete them manually."
    fi
fi


#add host name to /etc/hosts
if $host ; then
    if grep -Fxq "$hostname" /etc/hosts ; then
        echo "/etc/hosts already contains an entry for $hostname. Will not update."
    else
        echo "Adding to /etc/hosts..."
        echo "127.0.0.1 $hostname #This was added by Fora" | sudo tee -a /etc/hosts
    fi    
fi


#Install mongodb
if $mongodb || $mongodb_latest ; then
    if $dont_force && command -v mongod >/dev/null; then
        echo "Mongodb is already installed."
    else
        if $mongodb ; then
            sudo apt-get install mongodb
        else
            if $mongodb_latest ; then
                echo "Mongodb is not installed. Will install."
                sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
                echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
                sudo apt-get update
                sudo apt-get install mongodb-10gen
                #sudo mkdir -p /data/db
                #sudo chmod 0755 /data/db
                #sudo chown mongodb /data/db
            fi
        fi
    fi
fi

#Install graphicsmagick
if $gm ; then
    sudo apt-get install graphicsmagick
fi

#Install config files
if $config_files ; then
    if [ ! -f server/src/conf/settings.config ]; then
        cp server/src/conf/settings.config.sample server/src/conf/settings.config
    fi
    if [ ! -f server/src/conf/fora.config ]; then
        sudo sh -c "cat server/src/conf/fora.config.sample | sed -e 's_fora.host.name_"$hostname"_g' > server/src/conf/fora.config"
    fi
fi

#Install all node modules we need
if $node_modules ; then
    sudo npm install -g less    
    sudo npm install -g regenerator
    sudo npm install -g react-tools
    
    cd server
    npm install koa
    npm install koa-route
    npm install koa-favicon
    npm install koa-hbs    
    npm install co
    npm install co-body
    npm install co-multipart
    npm install thunkify    
    npm install mongodb
    npm install validator
    npm install sanitizer
    npm install handlebars
    npm install fs-extra
    npm install gm
    npm install node-minify
    npm install oauth
    npm install marked
    npm install optimist
    npm install multiparty
    npm install react
    npm install path-to-regexp
    cd ..
    
    cd www-client
    npm install node-minify
    cd ..    
fi


echo "Install complete."
