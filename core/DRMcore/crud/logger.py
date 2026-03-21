import pprint

from django.utils import timezone
from django.conf import settings as ds  # stands for django-settings
from core.helpers import strings
from core.dotzSettings import settings

class Logger:
    def settings(self, app):
        self.app = app
        self.onProd = settings.get('project.logCrudOnProd')
        self.now = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        self.loggerFile = settings.get(self.app + '.crud_logger_file')

    def canLog(self):
        if ds.DEBUG or self.onProd == True:
            return True
        
        return False

        
    def record(self, subject, logMessage, level = 1):
        """
            Logs all C.U.D. operations in designated log-keeping-file
            
            :param subject: [*] any variable to inspect in logs
            :param logMessage: string message for log
            :param level: 1 = minimal details | 2 = deep dive into 'subject'
        """
        if self.canLog():
            self.log(subject, logMessage, level)


    def log(self, subject, logMessage = 'SIMPLE TEST OF VALUES:', level = 1):
        """
            Params:
                - subject: the variable you wish to log
                - logMessage: additional meta data you wish to tack on
                - level [int]: 1 = simple parse of object. 2 = More introspection. 3 = trace from provided subject (error object)
        """
        
        varType = type(subject)
        log = ''

        if isinstance(subject, str):
            log = subject
        else:
            if strings.isPrimitiveType(subject):
                log = str(subject)
            else:
                try:
                    log = pprint.pformat(subject)
                    
                except KeyError as e:
                    log = "KeyError while converting subject to string. Log failed."
                except Exception as e:
                    log = "Exception while converting subject to string. Log failed."
                
        
        msg = f"""
{self.now} | Variable type: {varType} | SPACE: {self.app}
---------------
{logMessage}
---------------
{log}
---------------
"""

        # @todo: introduce background operation for this?
        with open(self.loggerFile, "at") as f:
            f.write(msg)

