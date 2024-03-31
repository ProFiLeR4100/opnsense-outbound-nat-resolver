# OPNsense Outbound-NAT Resolver

## 1. Description

When Outbound NAT rule is applied then source IP that is visible
for the service to which packet is redirected to (i.e. Caddy)
is replaced by IP of firewall instance (i.e. 192.168.0.1).
This microservice exists to get chain of (src/nat/dest) IPs and ports.


## 2. Usage

### 2. How to build docker image

#### 2.1. Clone repository

Execute next commands in terminal/console in order to glone repository.

```shell
git clone https://github.com/ProFiLeR4100/opnsense-outbound-nat-resolver.git
```

#### 2.2. Switch current directory

Execute next commands in terminal/console in order
to change directory/folder to one with app sources.

```shell
cd opnsense-outbound-nat-resolver
```

#### 2.3. Build image

Execute next commands in terminal/console in order to build
Docker image with REST app inside it. Locally it will be available
by tag `profiler4100/opnsense-outbound-nat-resolver:latest`

```shell
sudo docker build -t profiler4100/opnsense-outbound-nat-resolver .
```

### 3. Requirements

Before usage of this app create user (System->Access->User) with 
access to `Diagnostics: Show States` API, then create API key below
on the same screen, download file and this will contain `key` and `secret`.

### 4. Configuration & Instantiation

Everything is configurable using environmental variables.

#### 4.1. Environmental variables

Variables that are related to the work with OPNsense:

| Name                | Required? | Default                            |
|---------------------|-----------|------------------------------------|
| OPNSENSE_API_KEY    | **YES**   | `NONE`                             |
| OPNSENSE_API_SECRET | **YES**   | `NONE`                             |
| OPNSENSE_PROTO      |           | `http`                             |
| OPNSENSE_ADDR       |           | `192.168.0.1`                      |
| OPNSENSE_PORT       |           | `80`                               |

Variables that are related to the work of an Application:

| Name                | Required? | Default                            |
|---------------------|-----------|------------------------------------|
| APP_API_KEY         | **YES**   | `THIS_IS_TEMPORARY_KEY_REPLACE_ME` |
| APP_PORT            |           | `8080`                             |

#### 4.2 Instantiation of the service

```shell
sudo docker run -d \
  --restart=always \
  --name outbound_nat_resolver \
  -e OPNSENSE_PROTO=<INSERT_YOUR_OPNSENSE_WEBUI_PROTOCOL_HERE> \
  -e OPNSENSE_ADDR=<INSERT_YOUR_OPNSENSE_WEBUI_IP_ADDRESS_HERE> \
  -e OPNSENSE_PORT=<INSERT_YOUR_OPNSENSE_WEBUI_PORT_HERE> \
  -e OPNSENSE_API_KEY=<INSERT_YOUR_OPNSENSE_KEY_HERE> \
  -e OPNSENSE_API_SECRET=<INSERT_YOUR_OPNSENSE_SECRET_HERE> \
  -e APP_API_KEY=<INSERT_RANDOM_KEY_THAT_WILL_BE_USED_TO_ACCESS_SERVICE> \
  -e APP_PORT=<INSERT_APP_PORT_HERE> \
  -p 8080:<INSERT_APP_PORT_HERE> \
  profiler4100/opnsense-outbound-nat-resolver:latest
```

#### 4.3 Test using curl

```shell
curl --header "Content-Type: application/json" \
  --request POST \
  --data "{\"data\":{\"address\":\"<INSERT_SOURCE_IP>\",\"port\":\"<INSERT_SOURCE_PORT>\"},\"apiKey\":\"<INSERT_APP_API_KEY>\"}" \
  http://<INSERT_DOCKER_CONTAINER_IP>:<INSERT_APP_PORT_HERE>/api/resolve
```

## 3. Miscellaneous

#### 3.1 Log example:
```
user@host:~/opnsense-outbound-nat-resolver $ node .

outbound-nat-resolver app listening on port 80!
127.0.0.1 requested to convert 192.168.0.3:44064, Error: SOURCE_IP_NOT_FOUND
127.0.0.1 requested to convert 192.168.0.3:8091, Result: 207.154.192.194:60386
```

*P.S. In order to see real IP of caller you need to use `macvlan` network driver for docker container in that case you can remove port forwarding in command above.*
