# Build Status

[![CircleCI](https://circleci.com/gh/OpenCHS/openchs-client.svg?style=svg)](https://circleci.com/gh/OpenCHS/openchs-client)

# Join our discussions
Join the chat on [Skype](https://join.skype.com/xiTU162DSJTd)

# License
[![License](https://img.shields.io/badge/license-AGPL-green.svg?style=flat)](https://github.com/openchs/openchs-client/blob/master/LICENSE)

# [Developer Documentations](https://avni.readme.io/docs/developer-environment-setup-ubuntu)

export versionCode=7
export versionName=7.0.0
export lfe_KEYSTORE_PASSWORD=<password>
export lfe_KEY_PASSWORD=<password>
export lfe_KEY_ALIAS=openchs-release-key

flavor='lfe' make release_prod_dev_without_clean

flavor='lfe' make bundle_release_prod