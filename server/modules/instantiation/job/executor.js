var _ = require('underscore');
var path = require('path');
var fs = require('fs-extra');

module.exports = function () {

    class JobExecutorCollection {
        constructor() {
            this.jobExecutors = [];
        }

        add(jobExecutor) {
            this.jobExecutors.push(jobExecutor);

            return this;
        }

        getSupporting(job) {
            var supportingJobExecutors = _.filter(
                this.jobExecutors,
                (jobExecutor) => jobExecutor.supports(job)
            );
            if (0 === supportingJobExecutors.length) {
                throw new Error(`No supporting job executor for job ${job.toString()}.`);
            }
            if (supportingJobExecutors.length > 1) {
                throw new Error(`More than one supporting job executor for job ${job.toString()}.`);
            }

            return supportingJobExecutors[0];
        }
    }

    return {
        JobExecutorCollection
    };

};