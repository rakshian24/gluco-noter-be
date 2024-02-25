export const typeDefs = `

  scalar DateTime
  scalar IntOrString

  type User {
    _id: ID
    username: String
    email: String
  }

  type AuthResponse {
    user: User
    token: String
  }

  enum GlucoseReadingType {
    BB
    AB
    BL
    AL
    BD
    AD
  }

  type Food {
    _id: ID
    value: String
    label: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type GlucoseReading {
    _id: ID
    type: GlucoseReadingType!
    user: User!
    reading: Int!
    isMedsTaken: Boolean!
    isExercised: Boolean!
    insulinUnits: Int!
    consumedFoods: [Food]!
    description: String
    createdAt: DateTime
    updatedAt: DateTime
  }
  
  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }
  
  input LoginInput {
    email: String!
    password: String!
  }

  input FoodInput {
    value: String!
    label: String!
  }

  input GlucoseReadingInput {
    type: GlucoseReadingType!
    reading: Int!
    isMedsTaken: Boolean!
    isExercised: Boolean!
    description: String
    consumedFoods: ID!
  }

  type GlucoseReadingsGroupedByDate {
    _id: String
    results: [GlucoseReading]
  }

  type ReadingReport {
    date: String
    bb: IntOrString
    breakfast: String
    ab: IntOrString
    bl: IntOrString
    lunch: String
    al: IntOrString
    bd: IntOrString
    dinner: String
    ad: IntOrString
    morningInsulinUnits: IntOrString
    afternoonInsulinUnits: IntOrString
    eveningInsulinUnits: IntOrString
    nightInsulinUnits: IntOrString
  }
  
  type Query {
    me: User
    getAllFoods: [Food]
    getAllReadingsGroupedByDate: [GlucoseReadingsGroupedByDate]
    getAllReadingForDate(date: String!): [GlucoseReading]
    getReadingsReport: [ReadingReport]
  }
  
  type Mutation {
    registerUser(registerInput: RegisterInput): AuthResponse
    loginUser(loginInput: LoginInput): AuthResponse

    createFood(foodInput: FoodInput): Food
    createGlucoseReading(type: GlucoseReadingType!
      reading: Int!
      isMedsTaken: Boolean!
      isExercised: Boolean!
      description: String
      consumedFoods: ID!
      insulinUnits: Int!
      createdAt: String!
      updatedAt: String!): GlucoseReading
  }
`;
