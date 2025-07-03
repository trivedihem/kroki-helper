@startuml

class Animal {
  +name: String
  +age: int
  +makeSound(): void
}

class Dog extends Animal {
  +breed: String
  +makeSound(): void
}

class Cat extends Animal {
  +color: String
  +makeSound(): void
}

Animal <|-- Dog
Animal <|-- Cat

@enduml
@startuml

class Animal {
  +name: String
  +age: int
  +makeSound(): void
}

class Dog extends Animal {
  +breed: String
  +makeSound(): void
}

class Cat extends Animal {
  +color: String
  +makeSound(): void
}

Animal <|-- Dog
Animal <|-- Cat

@enduml
