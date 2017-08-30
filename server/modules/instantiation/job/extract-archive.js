var path = require('path');
var fs = require('fs-extra');
var decompress = require('decompress');

module.exports = function (baseClasses) {

    var { ComponentInstanceJob, JobExecutor } = baseClasses;

    const BUFFER_SIZE = 64 * 1024 * 1024;

    class ExtractArchiveJob extends ComponentInstanceJob {}

    class ExtractArchiveJobExecutor extends JobExecutor {
        supports(job) {
            return (job instanceof ExtractArchiveJob);
        }

        execute(job) {
            return new Promise((resolve, reject) => {
                var { componentInstance, componentInstance: { buildInstance } } = job;

                componentInstance.log('Extracting archive.');

                componentInstance.relativePath = componentInstance.id;
                decompress(componentInstance.zipFileFullPath, componentInstance.fullBuildPath, { strip: 1 })
                    .then(() => {
                        fs.unlink(
                            componentInstance.zipFileFullPath,
                            (error) => {
                                if (error) {
                                    componentInstance.log('Failed to remove archive after extracting.');
                                    reject(error);

                                    return;
                                }

                                resolve();
                            }
                        )
                    })
                    .catch((error) => {
                        componentInstance.log('Failed to extract archive.');
                        reject(error)
                    });
            });
        }
    }

    return {
        ExtractArchiveJob,
        ExtractArchiveJobExecutor
    };

};