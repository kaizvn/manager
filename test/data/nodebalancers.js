export const nodebalancers = {
  nodebalancers: [
    {
      datacenter: {
        id: 'newark',
        label: 'Newark, NJ',
        country: 'us',
      },
      status: 'new_active',
      updated: '2017-03-06T22:00:48',
      label: 'nodebalancer-1',
      created: '2017-03-03T18:08:44',
      hostname: 'nb-1-1-1-1.newark.nodebalancer.linode.com',
      id: 23,
      client_conn_throttle: 0,
      ipv4: '1.1.1.1',
      _configs: {
        configs: [
          {
            check_timeout: 30,
            nodebalancer_id: 23,
            check_path: '',
            check_attempts: 3,
            id: 2,
            label: 'none',
            check_interval: 0,
            protocol: 'http',
            algorithm: 'roundrobin',
            cipher_suite: 'recommended',
            stickiness: 'none',
            check_passive: 1,
            port: 80,
            check_body: '',
            check: 'none',
          },
          {
            check_timeout: 30,
            nodebalancer_id: 23,
            check_path: '',
            check_attempts: 3,
            id: 3,
            label: 'none',
            check_interval: 0,
            protocol: 'http',
            algorithm: 'roundrobin',
            cipher_suite: 'recommended',
            stickiness: 'none',
            check_passive: 1,
            port: 81,
            check_body: '',
            check: 'none',
          },
        ],
      },
    },
  ],
};