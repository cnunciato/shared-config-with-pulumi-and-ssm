# shared-config-with-pulumi-and-ssm

An example of using [Pulumi](https://pulumi.com/) with [AWS Systems Manager](https://aws.amazon.com/systems-manager/) to share Pulumi-managed configuration across multiple stacks.

You'll find three Pulumi projects in this repository:

* `shared-config` is a [Pulumi YAML](https://www.pulumi.com/blog/pulumi-yaml/) project that defines a couple of configuration items (one plain-text, one encrypted secret) and manages them with AWS Systems Manager Parameter Store.

* `my-website` is a Pulumi YAML project that uses Pulumi stack references to get the names of the parameters from `shared-config`, fetch their values from Parameter Store, and use them to render a static web page.

* `my-service` is a Pulumi TypeScript project that operates similarly, but instead uses an AWS Lambda function to read the values from Parameter Store on demand.

## Installing

Pulumi YAML projects don't have dependencies, so the only project you need to install is the TypeScript one:

```
npm -C my-service install
```

## Creating stacks

Initialize (and select) a `dev` stack for each project:

```bash
pulumi -C shared-config stack init dev
pulumi -C my-website stack init dev
pulumi -C my-service stack init dev
```

## Configuring

Configure all three stacks with your AWS region of choice:

```bash
pulumi -C shared-config config set aws:region us-west-2
pulumi -C my-website config set aws:region us-west-2
pulumi -C my-service config set aws:region us-west-2
```

Configure the two items managed by the `shared-config` stack:

```bash
pulumi -C shared-config config set motd 'Hello from Pulumi!'
pulumi -C shared-config config set motd_secret 'Ssh! This is a secret.' --secret
```

Lastly, make sure you change all all stack references from `cnunciato` to your own Pulumi organization name!

## Deploying

```bash
pulumi -C shared-config up --yes
pulumi -C my-website up --yes
pulumi -C my-service up --yes
```

## Viewing the result

```bash
open $(pulumi -C my-website stack output url)
```

```bash
curl $(pulumi -C my-service stack output url)
```

## Destroying

```bash
pulumi -C shared-config destroy
pulumi -C my-website destroy
pulumi -C my-service destroy
```
