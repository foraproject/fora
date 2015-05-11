#This checks if there are uncommitted files in any of the projects associated with fora

runtask() {
    curdir=`pwd`
    proj=$1
    basedir=$2
    echo checking $basedir/$proj
    echo ----------------------
    cd $basedir/$proj
    git status
    cd $curdir
    echo
}

echo ....................................
echo Git Status
echo ....................................

runtask "fora-template-blog" "node_modules"

runtask "ceramic-backend-mongodb" "node_modules/fora-template-blog/node_modules"
runtask "ceramic-backend-nedb" "node_modules/fora-template-blog/node_modules"

runtask "isotropy-browser-mode" "node_modules/fora-template-blog/node_modules";
runtask "isotropy" "node_modules/fora-template-blog/node_modules/isotropy-browser-mode/node_modules";
runtask "isotropy-koa-context-in-browser" "node_modules/fora-template-blog/node_modules/isotropy-browser-mode/node_modules";
runtask "isotropy-request-response-in-browser" "node_modules/fora-template-blog/node_modules/isotropy-browser-mode/node_modules/isotropy-koa-context-in-browser/node_modules";

runtask "isotropy-koa-mode" "node_modules/fora-template-blog/node_modules";
runtask "isotropy" "node_modules/fora-template-blog/node_modules/isotropy-koa-mode/node_modules";

runtask "isotropy-dev-mode" "node_modules/fora-template-blog/node_modules";
runtask "isotropy" "node_modules/fora-template-blog/node_modules/isotropy-dev-mode/node_modules";
runtask "koa-in-browser" "node_modules/fora-template-blog/node_modules/isotropy-dev-mode/node_modules";
runtask "isotropy-request-response-in-browser" "node_modules/fora-template-blog/node_modules/isotropy-dev-mode/node_modules/koa-in-browser/node_modules";
