import path from "path";
import fsutils from "../../../utils/fs";
import configutils from "../../../utils/config";
import { getLogger } from "../../../utils/logging";
import getCommonTasks from "../build-utils/common-tasks";
import getStandardBuild from "../build-utils/standard-build";

let build = getStandardBuild(
    "production",
    function*(siteConfig, builtInPlugins, buildUtils) {
        let { getTranspileServerTask, getLessTask, getCopyStaticFilesTask, getWriteConfigTask, getBuildClientTask } = getCommonTasks("client-debug", siteConfig, builtInPlugins);

        let buildConfigReader = configutils.getReader(siteConfig, ["builds", "production"]);
        let browserBuildFileSuffix = buildConfigReader(["browser-build-file-suffix"], "~client");
        let browserReplacedFileSuffix = buildConfigReader(["browser-replaced-file-suffix"], "_base");

        let tasks = [
            getTranspileServerTask({
                name: "transpile-server"
            }),
            getLessTask({
                name: "less"
            }),
            getCopyStaticFilesTask({
                name: "copy-static-files",
                destination: siteConfig.destination
            }),
            getWriteConfigTask({
                name: "write-config",
                destination: siteConfig.destination
            }),
            getWriteConfigTask({
                name: "write-client-config",
                destination: buildConfigReader(["client-build-dir"], "js")
            }),
            getBuildClientTask({
                name: "build-browser-app",
                browserBuildFileSuffix,
                browserReplacedFileSuffix,
                debug: false
            })
        ];

        return tasks;
    }
);

export default build;
