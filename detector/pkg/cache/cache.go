package cache

import (
	"sync"
)

type Cache struct {
	entries map[string]string
	sync.Mutex
}

func NewCache() *Cache {
	return &Cache{
		entries: make(map[string]string),
	}
}

func (c *Cache) Update(key, value string) (string, bool) {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()

	v, ok := c.entries[key]
	if !ok {
		v = ""
	}
	c.entries[key] = value
	return v, v != value
}

func (c *Cache) Get(key string) (string, bool) {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()

	value, ok := c.entries[key]
	return value, ok
}

func (c *Cache) Delete(key string) (string, bool) {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()

	value, ok := c.entries[key]
	delete(c.entries, key)
	return value, ok
}
