# zeppelin-highcharts-pie

The Pie Chart for Apache Zeppelin using [highcharts](https://www.amcharts.com/)

## Compatibility

| Chart Version | Zeppelin Version |
| :---: | :---: |
| ALL | 0.7.0+ |

## Install

```shell
# $ZEPPELIN_HOME=/opt/zeppelin
cd $ZEPPELIN_HOME/local_repo/
git clone https://github.com/lonly197/zeppelin-highcharts-pie.git
cd zeppelin-highcharts-pie
npm install
cp zeppelin-highcharts-pie.json $ZEPPELIN_HOME/helium/
```

Place zeppelin-highcharts-pie.json in local registry (default location is ZEPPELIN_HOME/helium.)
And enable visualization from Helium menu.

## Usage

- **category**: `categorical`
- **value**: `number`
- **drill-down**: `categorical`

## Screenshots 

![](https://raw.githubusercontent.com/lonly197/zeppelin-highcharts-pie/master/screenshots/pie-usage.gif)

## License

- Library: [highcharts](http://www.highcharts.com/)
- Icon: [icons8.com](https://icons8.com/web-app/21214/pie-chart) 
