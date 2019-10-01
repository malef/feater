const baseUrl = 'http://api.feater';

export const environment = {
    production: true,
    assetUploadUrl: `${baseUrl}/asset`,
    dockerLogsDownloadUrl: `${baseUrl}/download/docker-logs/:instanceId/:serviceId`,
    downloadableDownloadUrl: `${baseUrl}/download/downloadable/:instanceId/:downloadableId`,
    apiBaseUrl: `${baseUrl}/api`,
    signinUrl: `${baseUrl}/signin`,
    signoutUrl: `${baseUrl}/signout`,
};
