from setuptools import setup, find_packages

setup(
    name='tracking',
    version='1.0.0',
    package=['tracking'],
    include_package_data=True,
    packages=find_packages(),
    install_requires=[
        'flask',
        'requests',
    ],
)
