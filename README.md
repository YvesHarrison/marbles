# 部署链代码开发环境:

# 1. 
  Docker，确保终端操作系统版本为Windows 10 Pro，并打开Hyper-v。在官网https://store.docker.com/editions/community/docker-ce-desktop-windows 下载Docker CE-v1.13或以上版本，并安装，运行docker version指令检查安装情况和Docker版本。程序使用的Docker版本为17.06.2-ce。如果使用不提供Hyper-v服务的Windows版本，请下载Docker Toolbox提供Docker功能
# 2. 
  Git，github提供的良好的版本管理工具，在Windows操作系统下git bash会与git一同安装，运行后缀为.sh的脚本文件。https://git-scm.com/downloads 下载系统对应的安装包，在安装完成后，使用如下命令确认git安装git --version
# 3. 
  GoLang，https://studygolang.com/dl 下载系统对应的安装包，Go安装包括编译器和对于编写链代码非常有用的Go的命令行接口，程序代码使用Go 1.75版本编译，完成Go安装后使用如下命令确认Go安装成功go --version，设置GOPATH环境变量
# 4. 
   Node.js，https://nodejs.org/dist/ 下载并安装合适版本的Node.js，在Windows操作系统下，包管理器npm将和Node.js一同安装。程序代码使用Node.js 6.10.2版本编译，完成Node.js安装后打开确保下述语句在终端上正常运行 node-v，npm-v
# 5. 
   Hyperledger Fabric，编写的任何链代码都需要从Hyperledger Fabric声明对链代码shim的调用。因此为了在本地修改、编译链代码，需要在GOPATH下安装fabric代码。如果跳过此步会带来无法在本地编译链代码的风险。但如果不需要对链代码进行修改，仅仅是使用链代码可以跳过本步骤。
   在GOPATH下创建父目录：
```
   GOPATH/src/github.com/hyperledger
```
   下载合适的Hyperledger Fabric代码到
``` 
   GOPATH/src/github.com/hyperledger/fabric
```
   下载地址：https://github.com/hyperledger/fabric/tree/release-1.0 （本程序使用Hyperledger Fabric v1.0.1）
   将此版本代码与你network/Fabric的提交哈希匹配
```
   cd fabric
   git checkout ae4e37d
```
# 6. 
   Docker Compose，用来定义和运行复杂应用的Docker工具，适合组合使用多个容器进行开发的场景，Windows下建议使用pip安装
```
   pip install docker-compose（python 2.7）
```
# 7. 
   安装数据库系统，本安装指南安装的系统代码使用sqlite3，下载地址：http://www.sqlite.org/download.html 下载
# 本地使用超级帐本网络:
# 8. 
   下载Fabric samples，提供已经完成编译的区块链网络配置文件和运行脚本
```
   git clone https://github.com/hyperledger/fabric-samples.git
```
# 9. 
   下载超级帐本的Docker容器，下载release-1.0版本，利用脚本下载容器，地址： https://github.com/hyperledger/fabric/tree/release-1.0 ，下载解压缩后进入父目录输入下列命令
```
   cd scripts
   bootstrap-1.0.1.sh
```
# 10. 
   打开Docker，进入Fabric samples文件夹使用下述指令启动网络 

```
   cd fabcar
   startFabric.sh
```
   在一到二分钟后命令行窗口关闭，运行docker ps命令查看正在运行中的docker容器，输出日志应如下：（图）
   关闭网络输入如下指令：
```
   cd basic-network
   stop.sh
```
   删除整个网络输入如下指令：
```
   cd basic-network
   teardown.sh
```
   该脚本删除docker内所有和网络相关的容器，删除后可使用startFabric.sh重新创建网络

# 11. 
   从GitHub网站下载程序代码到工作目录 
```
   git clone https://github.com/YvesHarrison/marbles.git
   cd marbles
``` 

# 12.
   配置数据库，表和属性信息，使用命令：
```
   sqlite3 test.db ".read test.sql"
```
# 13.
   在程序主目录下输入如下命令安装程序npm依赖
```    
   npm install
```
# 14.
   安装链代码，将链代码安装到节点的文件系统内，请确保各配置文件和配置脚本中所声明的链代码版本一致
```
   cd scripts
   node install_chaincode.js
```
# 15.
   实例化链代码，在通道上安装链代码，实例化成功后节点可以调用该链代码
```
   node instantiate_chaincode.js
```
# 系统部署:
# 16.
   运行程序，在父目录下运行以下命令：
```
   npm install gulp -g
   npm install sqlite3 -g
   npm install
   gulp marbles_local
```
访问localhost：3001查看程序