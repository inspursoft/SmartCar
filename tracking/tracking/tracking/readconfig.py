import configparser
import os

class ReadConfig:
    def __init__(self, filepath=None):
        if filepath:
            configpath = filepath
        else:
            root_dir = os.path.dirname(os.path.abspath('.'))
            configpath = os.path.join(root_dir, "config/tracking.config")
            print(configpath)
            self.cf = configparser.ConfigParser()
            self.cf.read(configpath)

    def get_nodes(self, param):
        value = self.cf.get("Nodes", param)
        return value

    def get_api(self,param):
        value = self.cf.get("API", param)
        return value

if __name__ == '__main__':
    test = ReadConfig()
    t = test.get_nodes("node")
    print(t)
