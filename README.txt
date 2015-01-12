Johannes Vainio
vainjo4 (ät) gmail.com
19th Nov 2014

---------------

A node.js throttling API client & aggregating API endpoint

---------------

Contains files
node_modules/throttler/throttler.js
throttler_test_client.js
throttler_test_endpoint.js
aggregation_endpoint.js

---------------

1) Throttling API client

Apps for testing the throttler (client & endpoint) can be run and modified to test 
the module. The get() method has been tested to work.

Other methods (put() etc.) haven't been tested but should work. Extra tests
can be added to the test apps if needed.

Also the throttling functionality has not seen real action, but i have faith
in it.

---------------

2) API endpoint for aggregation over SQL database

Works as expected; tested but no limits pushed.
The MySQL DB is not included.

---------------

Approximate time spent was about 8-10 hours over 4 sessions. I had minimal
experience with Node.js and none with MySQL's complex tool suite, so this took 
some googling to complete.
