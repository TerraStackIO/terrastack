#!/usr/bin/env python
from aws_cdk.core import Construct
from terrastack import App, Stack
from terrastack_aws_provider import AwsProvider, AwsS3Bucket

class SimpleStack(Stack):
    def __init__(self, scope: Construct, ns: str):
        super().__init__(scope, ns)

        AwsProvider(self, 'aws', region='eu-central-1')

        AwsS3Bucket(self, 'hello', bucket='world')

app = App()
SimpleStack(app, "MySimpleStack")
app.synth()